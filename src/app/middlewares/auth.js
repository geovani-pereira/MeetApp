import jwt from 'jsonwebtoken';

import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // token não passado na req
        return res.json({ error: 'Token not provided' });
    }
    // fazendo um split por ' ' no auth Header trazendo só o token sem Bearer
    const [, token] = authHeader.split(' ');

    try {
        // verify usa callback para transformar em async await usamos o promissify
        // jwt.verify compara o token que esta vindo com a secret key
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);

        // adicionando o id que veio no payload na req
        req.userId = decoded.id;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token Invalid' });
    }
};
