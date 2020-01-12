import server from "@/server"


exports.handler = (event, context, callback) => {

  const { path, queryStringParameters: params, httpMethod: method, body: payload, headers } = event

  server.makeReady(err => {

    if (err) throw err


    let url = path

    if (params) {

      const qs = Object.keys(params).map(key => `${key}=${params[key]}`)

      if (qs.length > 0) url = `${url}?${qs.join(`&`)}`

    }


    server.inject({ method, url, payload, headers, validate: false }, ({ statusCode, headers, result: body }) => {

      delete headers[`content-encoding`]

      delete headers[`transfer-encoding`]

      callback(null, { statusCode, headers, body })

    })

  })

}
