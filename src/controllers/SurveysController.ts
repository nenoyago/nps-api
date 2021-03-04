import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import { SurveysRepository } from '../repositories/SurveysRepository';

export class SurveysController {
  async create(request: Request, response: Response) {
    const { title, description } = request.body;

    const suveysRepository = getCustomRepository(SurveysRepository);

    const survey = suveysRepository.create({
      title,
      description
    });

    await suveysRepository.save(survey);

    return response
      .status(201)
      .json(survey);
  }

  async show(request: Request, response: Response) {
    const suveysRepository = getCustomRepository(SurveysRepository);

    const allSurveys = await suveysRepository.find();

    return response
      .status(201)
      .json(allSurveys);
  }
}