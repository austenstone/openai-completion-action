import * as core from '@actions/core';
import {
  Configuration,
  CreateCompletionRequest,
  OpenAIApi,
} from 'openai';

const run = async (): Promise<void> => {
  const engineId = core.getInput('engineId') || 'text-davinci-001';
  const payload: CreateCompletionRequest = {
    prompt: core.getInput('prompt'),
    max_tokens: parseInt(core.getInput('max_tokens')) || undefined,
    temperature: parseInt(core.getInput('temperature')) || undefined,
    top_p: parseInt(core.getInput('top_p')) || undefined,
    n: parseInt(core.getInput('n')) || undefined,
    stream: core.getInput('echo') ? Boolean(core.getInput('stream')) : undefined,
    logprobs: parseInt(core.getInput('logprobs')) || undefined,
    echo: core.getInput('echo') ? Boolean(core.getInput('echo')) : undefined,
    stop: core.getInput('stop'),
    presence_penalty: parseInt(core.getInput('presence_penalty')) || undefined,
    frequency_penalty: parseInt(core.getInput('frequency_penalty')) || undefined,
    best_of: parseInt(core.getInput('best_of')) || undefined,
    logit_bias: JSON.parse(core.getInput('logit_bias')) || undefined,
  };

  if (!prompt) {
    core.setFailed('No prompt provided');
    return;
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    // organization: 'string',
    // username: 'string',
    // password: 'string',
    // accessToken: 'string',
    // basePath: 'string',
    // baseOptions: {},
    // formDataCtor: {}
  });
  const openai = new OpenAIApi(configuration);


  core.info(`Request using engineId: ${engineId}
${JSON.stringify(payload, null, 2)}`);

  openai.createCompletion(engineId, payload).then((response) => {
    const data = response.data;
    data.choices = data.choices?.map((choice) => {
      choice.text = choice.text?.replace(/(?:\r\n|\r|\n)/g, '');
      return choice;
    });
    core.info(`Response:
${JSON.stringify(data, null, 2)}`);
    core.setOutput('response', JSON.stringify(data));
  }).catch((err) => {
    core.setFailed(err);
    return;
  });
};

export default run;
