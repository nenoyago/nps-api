import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';

import { AppError } from './AppError';

interface ValidationErrors {
  [key: string]: string[];
}

const errorHandler: ErrorRequestHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    let errors: ValidationErrors = {};

    error.inner.forEach(err => {
      errors[err.path] = err.errors;
    });

    return response
      .status(400)
      .json({ message: 'Validation fails', errors });

  } else if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json({ message: error.message });
  }

  return response
    .status(500)
    .json({ message: 'Internal server error' });
}

export default errorHandler;