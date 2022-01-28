# OpenAI Completion Action 🤖
You input some text as a prompt, and the model will generate a text completion that attempts to match whatever context or pattern you gave it.

For example, if you input
`Write a tagline for an ice cream shop.`, the model will generate a response like `Sweet treats for everyone!`.

## Usage
The action requires: 
- Input called `prompt` which is a string that the model will use to generate a completion.
- [OpenAI API Key](https://beta.openai.com/account/api-keys) as an enviroment variable called `OPENAI_API_KEY`

To see all other inputs visit [OpenAI Api Reference - Completions](https://beta.openai.com/docs/api-reference/completions/create)

The output of the action is a JSON string that can be parsed. The resulting JSON object will contain the response. Use `.choices[0].text` to get the first choice's text.

This example is a manual dispatch action that takes the prompt as input and prints out the response:
```yml
name: OpenAI Completion

on:
  workflow_dispatch:
    inputs:
      prompt:
        description: The prompt to generate completions for.
        required: true

jobs:
  openai_completion:
    runs-on: ubuntu-latest
    name: OpenAI
    steps:
      - uses: austenstone/openai-completion-action@main
        name: OpenAI Completion
        id: openai_completion
        with:
          prompt: ${{ github.event.inputs.prompt }}
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - uses: actions/github-script@v5
        name: Print the response text
        with:
          script:  console.log(JSON.parse('${{ steps.openai_completion.outputs.response }}').choices[0].text)
```

## [Example 1](https://github.com/austenstone/openai-completion-action/blob/main/.github/workflows/issue-labeler.yml)
Using the prompt to automatically assign labels to an issue when it's opened.

```yml
name: "OpenAI Issue Labeler"
on:
  issues:
    types: [opened, edited]

jobs:
  openai_completion_job:
    runs-on: ubuntu-latest
    name: OpenAI
    steps:
      - name: Dump GitHub context
        id: github_context_step
        run: echo '${{ toJSON(github) }}'
      - uses: actions/checkout@v2
      - uses: ./
        name: OpenAI Completion
        id: openai_completion
        with:
          prompt: 'Given the Possible Labels "database,api,ui,help,critical,permission,feature,bug,cleanup,algo,funny,idea" what are the best 3 labels for "${{ github.event.issue.title }}" and "${{ github.event.issue.body }}" in a csv list?'
          max_tokens: 5
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - uses: actions/github-script@v5
        name: Print the response text
        with:
          debug: true,
          script: |
            const text = JSON.parse('${{ steps.openai_completion.outputs.response }}').choices[0].text
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              labels: text.split(',').map(l => l.trim()).filter(l => l.length > 0)
            });
```