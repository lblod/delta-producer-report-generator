import { uuid, sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime } from 'mu';
import { updateSudo as update } from '@lblod/mu-auth-sudo';
import { CREATOR } from './constants';

export default async function sendErrorAlert({subject = 'Delta Report Generator', message, detail, reference} = {}) {
  if (!message) {
    throw 'ErrorAlert at least needs a message describing what went wrong.';
  }

  const id = uuid();
  const uri = `http://data.lblod.info/errors/${id}`;

  const q = `
      PREFIX mu:   <http://mu.semte.ch/vocabularies/core/>
      PREFIX oslc: <http://open-services.net/ns/core#>
      PREFIX dct:  <http://purl.org/dc/terms/>

      INSERT DATA {
        GRAPH <http://mu.semte.ch/graphs/error> {
            ${sparqlEscapeUri(uri)} a oslc:Error ;
                    mu:uuid ${sparqlEscapeString(id)} ;
                    dct:subject ${sparqlEscapeString(subject)} ;
                    oslc:message ${sparqlEscapeString(message)} ;
                    ${reference ? `dct:references ${sparqlEscapeUri(reference)} ;` : ''}
                    ${detail ? `oslc:largePreview ${sparqlEscapeString(detail)} ;` : ''}
                    dct:created ${sparqlEscapeDateTime(new Date().toISOString())} ;
                    dct:creator ${sparqlEscapeUri(CREATOR)} .
        }
      }
    `.trim();

  try {
    await update(q);
    console.log(`Successfully sent out an error-alert.\nMessage: ${message}`);
  } catch (e) {
    console.warn(`[WARN] Something went wrong while trying to store an error-alert.\nMessage: ${e}\nQuery: ${q}`);
  }
}
