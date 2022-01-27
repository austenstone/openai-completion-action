
const core = require('@actions/core');
const { Configuration, OpenAIApi } = require("openai");

const getCoreInput = (name) => {
    const input = core.getInput(name);
    return input.length === 0 ? undefined : input;
}

const engineId = getCoreInput('engineId') || 'text-davinci-001';
const prompt = getCoreInput('prompt');
const max_tokens = parseInt(getCoreInput('max_tokens')) || undefined;
const temperature = parseInt(getCoreInput('temperature')) || undefined;
const top_p = parseInt(getCoreInput('top_p')) || undefined;
const n = parseInt(getCoreInput('n')) || undefined;
const stream = getCoreInput('echo') ? Boolean(getCoreInput('stream')) : undefined;
const logprobs = parseInt(getCoreInput('logprobs')) || undefined;
const echo = getCoreInput('echo') ? Boolean(getCoreInput('echo')) : undefined;
const stop = getCoreInput('stop');
const presence_penalty = parseInt(getCoreInput('presence_penalty')) || undefined;
const frequency_penalty = parseInt(getCoreInput('frequency_penalty')) || undefined;
const best_of = parseInt(getCoreInput('best_of')) || undefined;
const logit_bias = getCoreInput('logit_bias');

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

const payload = {
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
    data.choices = data.choices.map((choice) => {
        choice.text = choice.text.replace(/(?:\r\n|\r|\n)/g, '')
        return choice;
    });
    core.info(`Response:
${JSON.stringify(data, null, 2)}`);
    core.setOutput('response', JSON.stringify(data));
}).catch((err) => {
    core.setFailed(err);
    return;
});
