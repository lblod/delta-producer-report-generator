if(!process.env.process.OUTBOX)
  throw `Environment variable 'OUTBOX' should be provided.`;
export const OUTBOX = process.env.OUTBOX;

if(!process.env.EMAIL_FROM)
  throw `Environment variable 'EMAIL_FROM' should be provided.`;
export const EMAIL_FROM = process.env.EMAIL_FROM;

if(!process.env.EMAIL_TO)
  throw `Environment variable 'EMAIL_TO' should be provided.`;
export const EMAIL_TO = process.env.EMAIL_TO;
