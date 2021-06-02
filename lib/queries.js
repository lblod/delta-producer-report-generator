import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDateTime, uuid } from 'mu';
import {
  PREFIXES,
  EMAIL_GRAPH,
  EMAIL_URI_PREFIX
} from './constants';
import {
  EMAIL_FROM,
  EMAIL_TO,
  OUTBOX
} from './env';

export async function getErrorMessage(error) {
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
          nmo:plainTextMessageContent ${sparqlEscapeString(content.text)} ;
          nmo:htmlMessageContent ${sparqlEscapeString(content.html)} ;
          nmo:sentDate ${sparqlEscapeDateTime(now)} ;
          nmo:isPartOf ${sparqlEscapeUri(OUTBOX)} .
      }
    }
  `;

  await update(q);
}
