import * as core from '@actions/core';
import {
    Configuration,
    CreateCompletionRequest,
    OpenAIApi,
} from 'openai';

const run = async (): Promise<void> => {
    const engineId = core.getInput('engineId') || 'text-davinci-001';
    const prompt = core.getInput('prompt');
    const max_tokens = parseInt(core.getInput('max_tokens')) || undefined;
    const temperature = parseInt(core.getInput('temperature')) || undefined;
    const top_p = parseInt(core.getInput('top_p')) || undefined;
    const n = parseInt(core.getInput('n')) || undefined;
    const stream = core.getInput('echo') ? Boolean(core.getInput('stream')) : undefined;
    const logprobs = parseInt(core.getInput('logprobs')) || undefined;
    const echo = core.getInput('echo') ? Boolean(core.getInput('echo')) : undefined;
    const stop = core.getInput('stop');
    const presence_penalty = parseInt(core.getInput('presence_penalty')) || undefined;
    const frequency_penalty = parseInt(core.getInput('frequency_penalty')) || undefined;
    const best_of = parseInt(core.getInput('best_of')) || undefined;
    const logit_bias = JSON.parse(core.getInput('logit_bias')) || undefined;

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

    const payload: CreateCompletionRequest = {
        prompt,
        max_tokens,
        temperature,
        top_p,
        n,
        stream,
        logprobs,
        echo,
        stop,
        presence_penalty,
        frequency_penalty,
        best_of,
        logit_bias
    };

    core.info(`Request using engineId: ${engineId}
${JSON.stringify(payload, null, 2)}`);

    openai.createCompletion(engineId, payload).then((response) => {
        const data = response.data;
        data.choices = data.choices?.map((choice) => {
            choice.text = choice.text?.replace(/(?:\r\n|\r|\n)/g, '')
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