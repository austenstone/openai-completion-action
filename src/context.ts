import * as core from '@actions/core';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';

const run = async (): Promise<void> => {
  const prompt = core.getInput('prompt');
  if (!prompt) {
    core.setFailed('No prompt provided');
    return;
  }
  const payload: CreateChatCompletionRequest = {
    model: core.getInput('engineId') || 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: prompt
    }]
  };

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  core.info(`Request using model: ${payload.model}\n${JSON.stringify(payload, null, 2)}`);

  try {
    const response = await openai.createChatCompletion(payload);
    const data = response.data;
    // data.choices = data.choices?.map((choice) => {
    //   choice.message = choice.message?.replace(/(?:\r\n|\r|\n)/g, '');
    //   return choice;
    // });
    core.setOutput('response', JSON.stringify(data));
  } catch (error) {
    core.setFailed(JSON.stringify(error));
  }
};

export default run;
