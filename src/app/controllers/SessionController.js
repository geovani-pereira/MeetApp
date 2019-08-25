import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
    // criando a sessão
    async store(req, res) {
        // validação
        const schema = Yup.object().shape({
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validator Fails' });
        }
        // pegando os dados da req
        const { email, password } = req.body;
        // busca um usuario dentro do banco com o email vindo na req
        const user = await User.findOne({ where: { email } });

        // caso não encontre o usuário no banco
        if (!user) {
            return res.status(401).json({ error: 'User not found !' });
        }

        // caso encontre o usuário
        if (!(await user.checkPassword(password))) {
            return res.status(401).json({ error: 'Password does not match' });
        }

        // se o password passou pega os dados fora o email que ja recebeu na req
        const { id, name } = user;

        return res.json({
            user: {
                id,
                name,
                email,
            },
            // gerando o token: no primeiro parametro vai o payload
            // segundo parametro a secret key
            // terceiro parametro em quanto tempo o token expira
            // criei um arquivo auth.js dentro de config para armazenar as infos
            token: jwt.sign({ id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        });
    }
}

export default new SessionController();
