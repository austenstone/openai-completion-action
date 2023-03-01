import * as core from '@actions/core';
import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';

const run = async (): Promise<void> => {
  const payload: CreateCompletionRequest = {
    model: core.getInput('engineId') || 'gpt-3.5-turbo',
    prompt: core.getInput('prompt'),
    max_tokens: parseInt(core.getInput('max_tokens')) || undefined,
    temperature: parseInt(core.getInput('temperature')) || undefined,
    top_p: parseInt(core.getInput('top_p')) || undefined,
    n: parseInt(core.getInput('n')) || undefined,
    stream: core.getInput('stream') ? Boolean(core.getInput('stream')) : undefined,
    logprobs: parseInt(core.getInput('logprobs')) || undefined,
    echo: core.getInput('echo').length < 1 ? Boolean(core.getInput('echo')) : undefined,
    stop: core.getInput('stop') || undefined,
    presence_penalty: parseInt(core.getInput('presence_penalty')) || undefined,
    frequency_penalty: parseInt(core.getInput('frequency_penalty')) || undefined,
    best_of: parseInt(core.getInput('best_of')) || undefined,
    logit_bias: ((lb) => {
      try {
        return JSON.parse(lb);
      } catch (e) {
        return undefined;
      }
    })(core.getInput('logit_bias')),
  };

  if (!payload.prompt) {
    core.setFailed('No prompt provided');
    return;
  }

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  core.info(`Request using model: ${payload.model}\n${JSON.stringify(payload, null, 2)}`);

  openai.createCompletion(payload).then((response) => {
    const data = response.data;
    data.choices = data.choices?.map((choice) => {
      choice.text = choice.text?.replace(/(?:\r\n|\r|\n)/g, '');
      return choice;
    });
    core.info(`Response:\n${JSON.stringify(data, null, 2)}`);
    core.setOutput('response', JSON.stringify(data));
  }).catch((err) => {
    core.setFailed(err);
    return;
  });
};

export default run;
