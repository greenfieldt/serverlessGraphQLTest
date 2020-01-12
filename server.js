import hapi from "hapi"

import api from "@/api"

import graphiql from "@/graphiql"


const server = new hapi.Server()

server.connection({ routes: { cors: true } })


const plugins = [

  api,

  graphiql

]


let loaded = false

server.makeReady = (onServerReady) => {

  if (!loaded) {

    server.register(plugins, onServerReady)

    loaded = true

  }

  onServerReady(null)

}


export default server
