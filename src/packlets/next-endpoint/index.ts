import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { z, ZodType } from "zod";

export function createEndpoint<T extends ZodType>(options: EndpointOptions<T>): Endpoint<T> {
  return {
    handler: f => {
      const handler: NextApiHandler = async (req, res) => {
        try {
          const result = await f({ input: options.input.parse(req.body), req, res });
          if (result) {
            res.json(result);
          }
        } catch (error) {
          res.status(500).json({ message: String(error) });
        }
      };
      return handler;
    }
  }
}

interface EndpointOptions<T extends ZodType> {
  input: T;
}

interface Endpoint<T extends ZodType> {
  handler: (handler: EndpointHandler<z.infer<T>>) => NextApiHandler;
}

type EndpointHandler<T> = (params: EndpointHandlerParams<T>) => Promise<any>

interface EndpointHandlerParams<T> {
  input: T
  req: NextApiRequest;
  res: NextApiResponse;
}
