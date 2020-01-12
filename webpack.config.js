const { join } = require(`path`)

const slsw = require(`serverless-webpack`)

const nodeExternals = require(`webpack-node-externals`)

const MinifyPlugin = require(`babel-minify-webpack-plugin`)

const { DefinePlugin, ProvidePlugin, optimize } = require(`webpack`)

const { ModuleConcatenationPlugin } = optimize


const dotenv = require(`dotenv`)

dotenv.config() // import environment variables defined in '.env' located in our project root directory


const ENV = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() || (process.env.NODE_ENV = `development`)

const envProd = ENV === `production`

const srcDir = join(__dirname, `src`)

const outDir = join(__dirname, `dist`)

const npmDir = join(__dirname, `node_modules`)


module.exports = {

  entry: slsw.lib.entries,

  target: `node`,

  externals: [nodeExternals({ modulesFromFile: true })],

  output: {

    libraryTarget: `commonjs`,

    path: outDir,

    filename: `[name].js`

  },

  resolve: {

    extensions: [`.js`, `.gql`, `.graphql`],

    alias: {

      '@': srcDir // used to allow root-relative imports, ie: import { invariant } from "@/utilities"

    }

  },

  module: {

    rules: [

      { test: /\.js$/, loader: `babel-loader`, exclude: npmDir, options: {

        plugins: [

          `transform-optional-chaining`, // enables the usage of Existential Operator, ie: ?.

          `transform-object-rest-spread`,

          `transform-es2015-shorthand-properties`

        ],

        presets: [

          [`env`, {

            targets: { node: `6.10` }, // AWS Lambda uses node v6.10, so transpile our code for that environment

            useBuiltIns: `usage`

          }],

          `stage-0`

        ]

      } },

      { test: /\.(graphql|gql)$/, exclude: npmDir, loader: `graphql-tag/loader` } // in case you're using .gql files

    ]

   },

  plugins: [

    new DefinePlugin({ // used to provide environment variables as globals in our code

      ENV: JSON.stringify(ENV),

      LOGLEVEL: JSON.stringify(process.env.LOGLEVEL),

      FLICKR_API_KEY: JSON.stringify(process.env.FLICKR_API_KEY)

    }),

    new ProvidePlugin({ // used to provide node module exports as globals in our code

      // GraphQL

      GqlBool: [`graphql`, `GraphQLBoolean`], // same as import { GraphQLBoolean as GqlBool } from "graphql"

      GqlDate: [`graphql-iso-date`, `GraphQLDate`],

      GqlDateTime: [`graphql-iso-date`, `GraphQLDateTime`],

      GqlEmail: [`graphql-custom-types`, `GraphQLEmail`],

      GqlEnum: [`graphql`, `GraphQLEnumType`],

      GqlError: [`graphql`, `GraphQLError`],

      GqlFloat: [`graphql`, `GraphQLFloat`],

      GqlID: [`graphql`, `GraphQLID`],

      GqlInput: [`graphql`, `GraphQLInputObjectType`],

      GqlInt: [`graphql`, `GraphQLInt`],

      GqlInterface: [`graphql`, `GraphQLInterfaceType`],

      GqlList: [`graphql`, `GraphQLList`],

      GqlNonNull: [`graphql`, `GraphQLNonNull`],

      GqlObject: [`graphql`, `GraphQLObjectType`],

      GqlScalar: [`graphql`, `GraphQLScalarType`],

      GqlSchema: [`graphql`, `GraphQLSchema`],

      GqlString: [`graphql`, `GraphQLString`],

      GqlTime: [`graphql-iso-date`, `GraphQLTime`],

      GqlUnion: [`graphql`, `GraphQLUnion`],

      GqlURL: [`graphql-custom-types`, `GraphQLURL`],

      globalId: [`graphql-relay`, `globalIdField`],

      toGlobalId: [`graphql-relay`, `toGlobalId`],

      fromGlobalId: [`graphql-relay`, `fromGlobalId`],

      // Daraloader

      Dataloader: `dataloader`,

      // Winston

      info: [`winston`, `info`],

      error: [`winston`, `error`]

    }),

    new ModuleConcatenationPlugin(),

    new MinifyPlugin({

      keepFnName: true,

      keepClassName: true,

      booleans: envProd,

      deadcode: true,

      evaluate: envProd,

      flipComparisons: envProd,

      mangle: false, // some of our debugging functions require variable names to remain intact

      memberExpressions: envProd,

      mergeVars: envProd,

      numericLiterals: envProd,

      propertyLiterals: envProd,

      removeConsole: envProd,

      removeDebugger: envProd,

      simplify: envProd,

      simplifyComparisons: envProd,

      typeConstructors: envProd,

      undefinedToVoid: envProd

    })

  ]

}
