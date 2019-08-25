import * as Yup from 'yup';
import User from '../models/User';
// importamos o user para usar os metodos dele
class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .required()
                .min(6),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validator fails' });
        }

        const userExists = await User.findOne({
            where: { email: req.body.email },
        });

        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const { id, name, email, provider } = await User.create(req.body);

        return res.json({
            id,
            name,
            email,
            provider,
        });
    }

    async update(req, res) {
        // fazendo a validação com Yup
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                // se for passado oldPassword, password é obrigatório
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                // oneOf([Yup.ref('password)]) é usado para fazer referencia a password
                // esta verificando se password é igual a confirmPassword
                // se for diferente retorna field
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        // se não passar na validação retorna erro
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validator Fails' });
        }
        const { email, oldPassword } = req.body;

        // trazendo os dados do user pela PK id vindo no payload do jwt
        const user = await User.findByPk(req.userId);

        // verificando o email que veio na req bate com o da busca pela Pk
        if (email !== user.email) {
            const userExists = await User.findOne({ where: { email } });
            // se o email ja existir não deixa fazer o update com o email
            if (userExists) {
                return res.status(400).json({ error: 'User already exists.' });
            }
        }
        // so vai entrar no await se o usuário estiver passando oldPassword
        if (oldPassword && !(await user.checkPassword(oldPassword))) {
            // no await verifica se a senha vinda é a cadastrada no banco
            // caso não for retorna o erro
            return res.status(401).json({ error: 'Password does not match' });
        }
        // se tudo estiver bem legal e nos conformes faz o update

        const { id, name, provider } = await user.update(req.body);
        // e retorna os dados atualizados
        return res.json({
            id,
            name,
            email,
            provider,
        });
    }
}

export default new UserController();
