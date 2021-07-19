/**
 * (C) Copyright IBM Corp. 2020.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */
import { ErrorType } from '../../types/errors';
import { MessageRequest, MessageResponse } from '../../types/message';
import { ServiceDesk, ServiceDeskFactoryParameters, ServiceDeskStateFromWAC } from '../../types/serviceDesk';
import { AgentProfile, ServiceDeskCallback } from '../../types/serviceDeskCallback';
import { stringToMessageResponseFormat } from '../../utils';

class EngageServiceDesk implements ServiceDesk {
  callback: ServiceDeskCallback;

  state: any;

  agent: AgentProfile;

  /**
   * The object that controls the current polling operation. A new object is created each time polling begins and
   * that polling can be stopped by setting the value in here to true.
   */
  private poller: { stop: boolean };

  constructor(parameters: ServiceDeskFactoryParameters) {
    this.callback = parameters.callback;
  }

  async startChat(connectMessage: MessageResponse): Promise<void> {
    console.log('startChat', connectMessage);

    // TODO: (history retrieval)
    // const history = (window as any).watsonAssistantChatOptions.history || [];

    // TODO: (1)
    // as from previous projects upon startChat method we are making fetch calls to API endpoinds
    // to authorize & establish session on which we will be sending and receiving messages

    this.callback.updateAgentAvailability({ position_in_queue: 99 });

    // TODO: (2)
    // get actual agent info and call this method (can be updated during the chat)

    this.agent = { id: 'agent_id', nickname: 'Engage Agent' };

    setTimeout(() => {
      this.callback.agentJoined(this.agent);
    }, 5000);

    // TODO: (3)
    // if genesys will be based on polling flow we start polling loop which
    // will be polling messages from genesys endpoints

    await this.__startPolling();

    return Promise.resolve();
  }

  endChat(): Promise<void> {
    console.log('endChat');

    // Stop polling as we don't want to keep doing it even if we fail to tell inContact the chat is over. We'll stop the current poller and clear this so we can get a new poller the next time we start polling.
    if (this.poller) {
      this.poller.stop = true;
      this.poller = undefined;
    }

    // TODO: make fetch request to endpoint to let genesys know about ended conversation

    return Promise.resolve();
  }

  async sendMessageToAgent(message: MessageRequest, messageID: string): Promise<void> {
    console.log('sendMessageToAgent', message, messageID);

    const request = await fetch('http://localhost:3000/post', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.input.text }),
    });
    await request.json();

    return Promise.resolve();
  }

  updateState?(state: ServiceDeskStateFromWAC): void {
    this.state = state;
  }

  userTyping?(isTyping: boolean): Promise<void> {
    console.log('userTyping', isTyping);
    return Promise.resolve();
  }

  userReadMessages?(): Promise<void> {
    console.log('userReadMessages');
    return Promise.resolve();
  }

  areAnyAgentsOnline(connectMessage: MessageResponse): Promise<boolean> {
    // TODO: make fetch call to middleware to retrieve is there any connected agents

    console.log('areAnyAgentsOnline', connectMessage);
    return Promise.resolve(true);
  }

  private async __startPolling(): Promise<void> {
    const poller = { stop: false };
    this.poller = poller;

    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const request = await fetch('http://localhost:3000/get', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        // eslint-disable-next-line no-await-in-loop
        const output = await request.json();

        this.callback.sendMessageToUser(stringToMessageResponseFormat(output.message), this.agent.id);

        // console.log(output);
      } catch (error) {
        // handle error upon middleware error
        this.callback.setErrorStatus({ type: ErrorType.DISCONNECTED, isDisconnected: true });
        poller.stop = true;
      }
    } while (!poller.stop);

    return Promise.resolve();
  }
}
export { EngageServiceDesk };
