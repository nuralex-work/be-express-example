import { json } from "express";
import jwt from "jsonwebtoken";
const FindAppIdKey = (appid: string) => {
  const list = [
    "DY7iXbSB4Nz0VFcsBSOlfYpsyAU6OxtGyvImi56nsaOux6GD4FZgXtBy3MsWRJ14Cfn9vFog91xW2hfPffO5Envd7M9ZatH9CZGde4mnh8Bdv6z8F670vnM7K0romLPQmY3sm3jFVL7QpWWFLoZKPlaI6XaVUomvuelDTl2ELtSMVf7otnuYOPtJIfsRMe00C9s2Wh4s9qLEVRQ0FNteZzB2IKVwe7xiOlgGh3sA2LhXTmn1ghWEdTyKE1bObvki nmPm3lxxQYp34gE2FFgtrDipCa3guXMucWZC9znDUlKqOzUglg4G7N0wvJCG6Lpz26MsLE6foSUrNaIRHgWLRRA0JUypHTi4581WlrXtCyRy0O2VVw05zDK7H4FFKscidk1Go3Btqksq7vF478tPtfiE8si5NKwcX1II82rzid3gAVWP9BJeeUKwICJpvQl2hJ7SQIABdNUO9LlU3rov9hsgzSfK9zYSqfMp3LvacLCWCVZwcxaqHLncyjfMpDzF KZBG9Fidg8lEcDOJ7gSrvE1AWg6Fb3w12csQA9t8i0UwOpC5taijfHbDvir7oVBRoYWLQTp9GBMFLXrvOWSZ51B56i5CoHeqLowWvUqfeeZj9FKlwLc0CtqM7ApBgRsOoPeWnBmc1eDm5SchJ43gebWIVPGDbIlIZhdqHLG7a0lQu0yW6jHYzlFTgj98tHGnvfy9YeutJeXLztjupQyfX6P0SoJl2C0aZQqzFFldcwML7Twi7GGrSXZCg4GyLqVu",
    "eqprnZpo4Q0hB6EbYAdqN3dZfBiYm4qzIST4VwbeeHYoeQy1tlNkaeGdPdJBzglYZAJ11p6YfJeKz4SAZoh3J9SiI9hlGKuGPBRUY0JpjAszhBepORxT3b35zoD8mV4dosZS9IgHyh95ptUdafsxufJyOH4jpF3h4S9XOGSYiE4h4wDJFe40j6LBFElOa59qfGSXNDDh4OcvbOrX08tPHlLBfREWLvIbzUGqqz8WcRPW0sIdNVGINI41FBzrzx3e bNNWJDyNhDB4Tx56elAOMqmMO6H9iYUAUQxoJmP7EidXmjxxcxfr252Q2FNhwdgGHFX1Vtb2LEAtOYH03xGWYzGQVuFkhQ02mdBkWVwli9AIROwb1KqtyHILafLSX9VafEOcbi09fjYsHIorszOxRIIbl9O8eXifXgsP6qAm6XTuijiznFbit1cQIbNAiaQ9YqviVqmB2I1ysLBq6Ubs0gVr7i7yUc7ZlhQI4pHMnkPEtpdH7uGbQnuUP2VX4d4l BKbOpAzlCQBQSr9zJcAQhRiNUs6RUYXaUSINkItLcb21CVX2pMuutEqi6oqjZ7VIGGTJJ1zPb3uA1WB5CgVbN8fPHOWimmW6H1JMhOuoWFaVHw4Mc7IRwmsfgAnxYGWrQMyLosuYOTXHnrfTGZy0IZOfKeAWOYqR3kXlcnQAeaPc6DLE21twj0qDgli8oXFY4vvFx1vtSvmMqo8O4EBj7bUXtNRTx2nyUV29Ku9HMMpGlPkV4D0LmtqiVJJC4V9I",
  ];
  const getkey = list.findIndex((x: any) => x === appid);
  return getkey;
};
const FindSecretKey = (idx: number) => {
  const list = [
    "310e2e84ecd7540dca74d4c5e7d3fd435ea06d43f6ae47d9e1011e3f98068cb5",
    "555c26c7b1154cad5406b216b1351eed2993754479bbdc2c2a405405fa3f8d6d",
  ];

  const secret = list[idx];
  return secret;
};
const GetUserFromToken = (req: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    if (!decoded) {
      return null;
    }

    const user = JSON.parse(JSON.stringify(decoded));
    return user.id;
  } catch (err) {
    return null;
  }
};

export { FindAppIdKey, FindSecretKey, GetUserFromToken };
