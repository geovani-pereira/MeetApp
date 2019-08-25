import { Sequelize } from 'sequelize'; // responsavel pela conexão

import User from '../app/models/User'; // importando os models

import databaseConfig from '../config/database'; // importando as configurações da DB

const models = [User]; // array contendo os models

class Database {
    constructor() {
        this.init();
    }

    // conexão com o banco de dados e carregamento dos models
    init() {
        this.connection = new Sequelize(databaseConfig);
        // esta sendo esperada dentro de models no metodo init()

        // se refere a user ou outro model para acessar os metodos do model
        models.map(model => model.init(this.connection));
        // map percorrendo o array chamando o metodo init() e passando a conexão
    }
}

export default new Database();
