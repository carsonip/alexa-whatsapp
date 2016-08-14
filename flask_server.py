from flask import Flask, jsonify, request
from yowsup.layers.protocol_messages.protocolentities  import TextMessageProtocolEntity
import store
import os
import copy
import json
from names import name_to_id, id_to_name

app = Flask(__name__)

yowsup_stack = None


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/message", methods=['GET'])
def message_get():
    msg = copy.deepcopy(store.unread_msg)
    print json.dumps(msg)
    for k in msg:
        name = id_to_name(k)
        if name is not None:
            msg[name] = msg[k]
            del msg[k]
    return jsonify(msg)


@app.route("/message", methods=['POST'])
def message_post():
    req_json = request.json
    recipient_name = req_json['recipient']
    recipient = name_to_id(recipient_name)

    if recipient is None:
        return jsonify({}), 400

    outgoingMessageProtocolEntity = TextMessageProtocolEntity(
        req_json['message'],
        to = recipient)

    yowsup_stack.send(outgoingMessageProtocolEntity)
    return jsonify({})

def flaskThread(stack):
    global yowsup_stack
    yowsup_stack = stack

    port = os.environ.get('PORT')
    if port is not None:
        port = int(port)

    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=port)
