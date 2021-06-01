# delta-producer-report-generator

Service that generates reports or warning emails about deltas.

## Installation

### docker-compose.yml

To add the service to your `mu.semte.ch` stack, add the following snippet to docker-compose.yml:

```yaml
services:
  delta-producer-report-generator:
    image: lblod/delta-producer-report-generator:x.x.x
    environment:
      EMAIL_FROM: "hello@from.com"
      EMAIL_TO: "hello@to.com"
    volumes:
      - ./config/delta/report-generator:/config
```

### Add configuration

Configure which job types you want to monitor and get an email when it fails.
An example of the `config.json` file:

```json
{
  "monitoredJobTypes": [
    "http://redpencil.data.gift/id/jobs/concept/JobOperation/deltas/initialCacheGraphSyncing/SomeTheme",
    "http://redpencil.data.gift/id/jobs/concept/JobOperation/deltas/deltaDumpFileCreation/SomeTheme",
    "http://redpencil.data.gift/id/jobs/concept/JobOperation/deltas/healingOperation/SomeTheme"
  ]
}
```

### Wire the deltas

This service works by receiving deltas from the [delta-notifier](https://github.com/mu-semtech/delta-notifier).
It should be configured as such :

```js
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      },
      object: {
        type: 'uri',
        value: 'http://redpencil.data.gift/vocabularies/deltas/Error'
      }
    },
    callback: {
      url: 'http://delta-producer-report-generator/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  },
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/ns/adms#status'
      },
      object: {
        type: 'uri',
        value: 'http://redpencil.data.gift/id/concept/JobStatus/failed'
      }
    },
    callback: {
      url: 'http://delta-producer-report-generator/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  },
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://redpencil.data.gift/vocabularies/tasks/operation'
      },
      object: {
        type: 'uri',
        value: 'http://redpencil.data.gift/id/jobs/concept/TaskOperation/deltas/healing/reportGeneration'
      }
    },
    callback: {
      url: 'http://delta-producer-report-generator/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  }
```

### Environment variables

Provided [environment variables](https://docs.docker.com/compose/environment-variables/) by the service. These can be added in within the docker declaration.

| Name                | Description                              | Default                         |
| ------------------- | ---------------------------------------- | ------------------------------- |
| `EMAIL_FROM`        | Email address from which emails are sent |                                 |
| `EMAIL_TO`          | Email address to which emails are sent   |                                 |
| `OUTBOX`          | Outbox URI (for deliver-email-service)   |                                 |

## Development

For a more detailed look in how to develop a microservices based on
the [mu-javascript-template](https://github.com/mu-semtech/mu-javascript-template), we would recommend
reading "[Developing with the template](https://github.com/mu-semtech/mu-javascript-template#developing-with-the-template)"

### Developing in the `mu.semte.ch` stack

Paste the following snip-it in your `docker-compose.override.yml`:

````yaml  
delta-producer-report-generator:
  image: semtech/mu-javascript-template:1.4.0
  environment:
    NODE_ENV: "development"
  volumes:
    - /absolute/path/to/your/sources/:/app/
````
