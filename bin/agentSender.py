#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import sys
import time
import spade
import cv2
import datetime
import base64

spade_server = os.environ.get('SPADE_ADDRESS')
print "spade_server_python", spade_server

class Sender(spade.Agent.Agent):
    class SendImgBehav(spade.Behaviour.OneShotBehaviour):
        def onStart(self):
            print "Starting SendImgBehav behaviour . . ."
            self.resp = 0
            msg = spade.ACLMessage.ACLMessage()
            msg.setPerformative("inform")
            msg.setOntology("login")
            msg.addReceiver(spade.AID.aid("coordinator@"+spade_server, ["xmpp://coordinator@"+spade_server]))
            msg.setContent('clients')
            self.myAgent.send(msg)
            print "Sended 1"

        def _onTick(self):
            print "TICK"
            self.myAgent.counter = self.myAgent.counter + 1
            msg = spade.ACLMessage.ACLMessage()
            msg.setPerformative("inform")
            msg.setOntology("img")
            print "TICK2"
            try:
                msg.addReceiver(spade.AID.aid("coordinator@"+spade_server, ["xmpp://coordinator@"+spade_server]))
                base64img = base64.b64encode(cv2.imread(self.myAgent.myFacialImagePath, 0))
                msg.setContent(base64img)
            except Exception as e:
                print str(e)
                msg = "No Content"

            self.myAgent.send(msg)
            print "Image sended!"
            self.myAgent.t0 = datetime.datetime.now()

    class RecvEmotionBehav(spade.Behaviour.Behaviour):
        """
        This EventBehaviour receives the response containing the facial emotion detection
        """
        def onStart(self):
            print "Starting behaviour RecvEmotionBehav. . ."
            self.myAgent.counter = 0

        def _process(self):
            print "RECEIVE SOMETHIN"
            self.msg = self._receive(True)

            if self.msg:
                t0 = datetime.datetime.now()
                print 'Received in %d seconds' % (t0-self.myAgent.t0).seconds
                # print "Response obtained"
                emotion = self.msg.getContent()
                print "-->", emotion
            else:
                print "No response"

            self.myAgent.stop()
            sys.exit(0)

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
    a.myFacialImagePath = img_path
    time.sleep(1)
    a.start()
    a.t0 = 0
    alive = True

    while alive:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            alive = False
    a.stop()
    sys.exit(0)


if __name__ == "__main__":
    main(sys.argv[2])
