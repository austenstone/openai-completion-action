
const core = require('@actions/core');
const { Configuration, OpenAIApi } = require("openai");

const getCoreInput = (name) => {
    const input = core.getInput(name);
    return input.length === 0 ? undefined : input;
}

const engineId = getCoreInput('engineId') || 'text-davinci-001';
const prompt = getCoreInput('prompt');
const max_tokens = parseInt(getCoreInput('max_tokens'));
const temperature = parseInt(getCoreInput('temperature'));
const top_p = parseInt(getCoreInput('top_p'));
const n = parseInt(getCoreInput('n'));
const stream = Boolean(getCoreInput('stream'));
const logprobs = parseInt(getCoreInput('logprobs'));
const echo = Boolean(getCoreInput('echo'));
const stop = getCoreInput('stop');
const presence_penalty = parseInt(getCoreInput('presence_penalty'));
const frequency_penalty = parseInt(getCoreInput('frequency_penalty'));
const best_of = parseInt(getCoreInput('best_of'));
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
