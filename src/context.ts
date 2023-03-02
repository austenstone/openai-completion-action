import * as core from '@actions/core';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';

interface Input extends CreateChatCompletionRequest {
  token: string;
  prompt?: string;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.model = core.getInput('model');
  result.prompt = core.getInput('prompt');
  if (!result.prompt) {
    core.setFailed('No prompt input provided');
    throw new Error('No prompt input provided');
  }
  const temperature = core.getInput('temperature');
  if (temperature) {
    result.temperature = Number(temperature);
  }
  const top_p = core.getInput('top_p');
  if (top_p) {
    result.top_p = Number(top_p);
  }
  const n = core.getInput('n');
  if (n) {
    result.n = Number(n);
  }
  const steam = core.getInput('stream');
  if (steam) {
    result.stream = Boolean(steam);
  }
  const stop = core.getInput('stop');
  if (stop) {
    result.stop = stop;
  }
  const max_tokens = core.getInput('max_tokens');
  if (max_tokens) {
    result.max_tokens = Number(max_tokens);
  }
  const presence_penalty = core.getInput('presence_penalty');
  if (presence_penalty) {
    result.presence_penalty = Number(presence_penalty);
  }
  const frequency_penalty = core.getInput('frequency_penalty');
  if (frequency_penalty) {
    result.frequency_penalty = Number(frequency_penalty);
  }
  const logit_basis = core.getInput('logit_bias');
  if (logit_basis) {
    result.logit_bias = JSON.parse(logit_basis);
  }
  const user = core.getInput('user');
  if (user) {
    result.user = user;
  }
  return result;
}

const run = async (): Promise<void> => {
  const input = getInputs();
  input.messages = [{
    role: 'user',
    content: input.prompt || '',
  }];
  delete input.prompt;
  const payload: CreateChatCompletionRequest = input;

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  core.info(`Request using model: ${payload.model}\n${JSON.stringify(payload, null, 2)}`);
  const response = await openai.createChatCompletion(payload);
  const data = response.data;
  data.choices = data.choices?.map((choice) => {
    if (choice.message?.content) {
      choice.message.content = choice.message?.content?.replace(/(?:\r\n|\r|\n)/g, '');
    }
    return choice;
  });
  core.setOutput('response', JSON.stringify(data));
};

export default run;
