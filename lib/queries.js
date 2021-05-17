import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDateTime, uuid } from 'mu';
import {
  PREFIXES,
  EMAIL_GRAPH,
  EMAIL_URI_PREFIX,
  OUTBOX
} from './constants';
import {
  EMAIL_FROM,
  EMAIL_TO
} from './env';

export async function getMessage(error) {
  const q = `
    ${PREFIXES}
    SELECT ?message
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(error)} oslc:message ?message .
      }
    }
  `;

  const result = await query(q);
  return result.results.bindings.length ? result.results.bindings[0].message.value : null;
}

export async function getJobInformation(job) {
  const q = `
    ${PREFIXES}
    SELECT ?type ?error
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(job)} task:operation ?type ;
          task:error/oslc:message ?error .
      }
    }
  `;

  const result = await query(q);
  if (result.results.bindings.length) {
    return {
      type: result.results.bindings[0].type.value,
      error: result.results.bindings[0].error.value
    }
  }
}

export async function getInputContainers(task) {
  const q = `
    ${PREFIXES}
    SELECT ?container
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(task)} task:inputContainer ?container .
      }
    }
  `;

  const result = await query(q);
  if (result.results.bindings.length) {
    return result.results.bindings.map(binding => binding.container.value)
  }
}

/**
 * Creates a warning email in the store and put it in the outbox
 */
export async function createWarningEmail(subject, content) {
  const emailUuid = uuid();
  const emailUri = `${EMAIL_URI_PREFIX}${emailUuid}`;
  const now = new Date().toISOString();

  const q = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(EMAIL_GRAPH)} {
        ${sparqlEscapeUri(emailUri)} a nmo:Email ;
          mu:uuid ${sparqlEscapeString(emailUuid)} ;
          nmo:messageFrom ${sparqlEscapeString(EMAIL_FROM)} ;
          nmo:emailTo ${sparqlEscapeString(EMAIL_TO)} ;
          nmo:messageSubject ${sparqlEscapeString(subject)} ;
          nmo:plainTextMessageContent ${sparqlEscapeString(content.TEXT)} ;
          nmo:htmlMessageContent ${sparqlEscapeString(content.HTML)} ;
          nmo:sentDate ${sparqlEscapeDateTime(now)} ;
          nmo:isPartOf ${sparqlEscapeUri(OUTBOX)} .
      }
    }
  `;

  const result = await update(q);
}
