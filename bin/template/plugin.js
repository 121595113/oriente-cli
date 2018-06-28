const utils = require('../utils');

exports.setItem = function (name, nameSpace, type) {
  return {
    "type": "ObjectExpression",
    "start": 98,
    "end": 312,
    "properties": [{
        "type": "Property",
        "start": 108,
        "end": 144,
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Literal",
          "start": 108,
          "end": 112,
          "value": "id",
          "raw": "\"id\""
        },
        "value": {
          "type": "Literal",
          "start": 114,
          // "end": 144,
          "value": `cordova-plugin-${name}.${utils.lastName(name)}`,
          "raw": `"cordova-plugin-${name}.${utils.lastName(name)}"`
        },
        "kind": "init"
      },
      {
        "type": "Property",
        "start": 154,
        "end": 207,
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Literal",
          "start": 154,
          "end": 160,
          "value": "file",
          "raw": "\"file\""
        },
        "value": {
          "type": "Literal",
          "start": 162,
          "end": 207,
          "value": `plugins/cordova-plugin-${name}/www/${name}.js`,
          "raw": `"plugins/cordova-plugin-${name}/www/${name}.js"`
        },
        "kind": "init"
      },
      {
        "type": "Property",
        "start": 217,
        "end": 252,
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Literal",
          "start": 217,
          "end": 227,
          "value": "pluginId",
          "raw": "\"pluginId\""
        },
        "value": {
          "type": "Literal",
          "start": 229,
          // "end": 252,
          "value": `cordova-plugin-${name}`,
          "raw": `"cordova-plugin-${name}"`
        },
        "kind": "init"
      },
      {
        "type": "Property",
        "start": 262,
        "end": 306,
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Literal",
          "start": 262,
          "end": 272,
          "value": type || "clobbers",
          "raw": `${type || "clobbers"}`
        },
        "value": {
          "type": "ArrayExpression",
          "start": type ? 264 + type.length : 274,
          // "end": 306,
          "elements": [{
            "type": "Literal",
            "start": 288,
            // "end": 296,
            "value": `${nameSpace  + utils.lastName(name)}`,
            "raw": `"${nameSpace + utils.lastName(name)}"`
          }]
        },
        "kind": "init"
      }
    ]
  }
}
