#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import sys
import time
import spade
import cv2
import datetime
import base64
import logging
import json
logging.basicConfig(filename="agentSender.log", level=logging.DEBUG)
spade_server = os.environ.get('SPADE_ADDRESS')
logging.info("spade_server_python: %s" % spade_server)


class Sender(spade.Agent.Agent):
    class SendImgBehav(spade.Behaviour.OneShotBehaviour):
        def onStart(self):
            logging.info("Starting SendImgBehav behaviour . . .")
            self.resp = 0
            msg = spade.ACLMessage.ACLMessage()
            msg.setPerformative("inform")
            msg.setOntology("login")
            msg.addReceiver(spade.AID.aid("coordinator@"+spade_server, ["xmpp://coordinator@"+spade_server]))
            jsonMsg = {
                'type': 'client',
                'color_shape': 3
                }
            msg.setContent(json.dumps(jsonMsg))
            self.myAgent.send(msg)
            logging.info("Sended 1")

        def _process(self):
            logging.info("process")
            self.myAgent.counter = self.myAgent.counter + 1
            msg = spade.ACLMessage.ACLMessage()
            msg.setPerformative("inform")
            msg.setOntology("img")
            logging.info("process1")
            try:
                msg.addReceiver(spade.AID.aid("coordinator@"+spade_server, ["xmpp://coordinator@"+spade_server]))
                logging.error(self.myAgent.myFacialImagePath)
                base64img = base64.b64encode(cv2.imread(self.myAgent.myFacialImagePath, 0))
                msg.setContent(str(base64img))
            except Exception as e:
                logging.error("ERROR: generating base64: {}".format(str(e)))
                msg.setContent("No Content")

            self.myAgent.send(msg)
            logging.info("Image sended!")
            self.myAgent.t0 = datetime.datetime.now()

    class RecvEmotionBehav(spade.Behaviour.Behaviour):
        """
        This EventBehaviour receives the response containing the facial emotion detection
        """
        def onStart(self):
            logging.info("Starting behaviour RecvEmotionBehav. . .")
            self.myAgent.counter = 0

        def _process(self):
            self.msg = self._receive(block=True, timeout=2)

            if self.msg:
                logging.info("RECEIVE SOMETHIN")
                t0 = datetime.datetime.now()
                logging.info('Received in %d seconds' % (t0-self.myAgent.t0).seconds)
                # logging.info("Response obtained")
                emotion = self.msg.getContent()
                logging.info("emotion {}".format(emotion))
                print(emotion)
            else:
                logging.info("No response")

            self.myAgent.alive = False
            logging.info("Bye!")
            # self.myAgent.stop()
            # sys.exit(0)

    def _setup(self):
        # Create the template for the EventBehaviour: a message from myself
        template = spade.Behaviour.ACLTemplate()
        template.setOntology("emotion")
        t = spade.Behaviour.MessageTemplate(template)

        self.addBehaviour(self.RecvEmotionBehav(), t)
        # Add the sender behaviour
        b = self.SendImgBehav()
        self.addBehaviour(b, None)


def main(img_path):
    a = Sender("web-server@" + spade_server, "secret")
    # a.setDebugToScreen()
    a.myFacialImagePath = img_path
    time.sleep(1)
    a.start()
    a.t0 = 0
    a.alive = True

    while a.alive:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            a.alive = False
    a.stop()
    sys.exit(0)


if __name__ == "__main__":
    main(sys.argv[2])
