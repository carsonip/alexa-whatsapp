from flask import Flask, jsonify, request
from yowsup.layers.protocol_messages.protocolentities  import TextMessageProtocolEntity
import store
import os

app = Flask(__name__)

yowsup_stack = None


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/message", methods=['GET'])
def message_get():
    return jsonify(store.unread_msg)


@app.route("/message", methods=['POST'])
def message_post():
    req_json = request.json
    outgoingMessageProtocolEntity = TextMessageProtocolEntity(
        req_json['message'],
        to = req_json['recipient'])

    yowsup_stack.send(outgoingMessageProtocolEntity)
    return jsonify({})

def flaskThread(stack):
    global yowsup_stack
    yowsup_stack = stack
    app.run(debug=True, use_reloader=False, port=os.environ.get('PORT'))
