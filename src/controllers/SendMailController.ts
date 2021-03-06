import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import { resolve } from 'path';

import { AppError } from '../errors/AppError';

import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';

import SendMailService from '../services/SendMailService';

export class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      throw new AppError('User does not exists');
    }

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) {
        throw new AppError('Survey does not exists');
    }

    const surveysUsersAlreadyExists = await surveysUsersRepository
      .findOne({
        where: { user_id: user.id, value: null },
        relations: ['user', 'survey']
      });

    // Send email to user
    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: '',
      link: process.env.URL_MAIL
    };

    if (surveysUsersAlreadyExists) {
      variables.id = surveysUsersAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);

      return response
        .status(201)
        .json(surveysUsersAlreadyExists);
    }

    // Save the information in the surveys_users table
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    });

    variables.id = surveyUser.id;

    await surveysUsersRepository.save(surveyUser);

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response
      .status(201)
      .json(surveyUser);
  }
}