import { graphqlHapi } from "apollo-server-hapi"

import depthLimit from 'graphql-depth-limit'

import queryComplexity from "graphql-query-complexity"

import * as loaders from "@/loaders"

import { formatError } from "@/utilities"

import { schema } from "@/schema"

import { Flickr } from "@/flickr"


export default {

  register: graphqlHapi,

  options: {

    path: `/graphql`,

    graphqlOptions: (request) => {

       // Create a new instance of our Flickr connector for each new GraphQL request

      const flickr = new Flickr(FLICKR_API_KEY)

      return {

        schema: schema,

        context: {

           // pass the connector instance to our resolvers and to the loaders which will cache per request

          flickr,

          album: loaders.loadAlbum(flickr),

          albumPhotos: loaders.loadAlbumPhotos(flickr),

          brands: loaders.loadBrands(),

          cameras: loaders.loadCamerasByBrand(),

          photo: loaders.loadPhoto(flickr),

          images: loaders.loadImages(flickr),

          licenses: loaders.loadLicenses(),

          user: loaders.loadUser(flickr),

          userAlbums: loaders.loadUserAlbums(flickr),

          userPhotos: loaders.loadUserPhotos(flickr)

        },

        root_value: schema,

        formatError: formatError,

        validationRules: [

          depthLimit(4), // Limits our queries to 4 levels of nesting.

          queryComplexity({

            maximumComplexity: 2000,

            variables: {},

            onComplete: (complexity) => { info(`Determined query complexity: ${complexity}`) },

            createError: (max, actual) =>

              new GqlError(`Query is too complex: ${actual}. Maximum allowed complexity: ${max}`)

          })

        ],

        tracing: true,

        debug: true

      }

    },

    route: { cors: true }

  }

}
