const knex = require("../database/knex/index.js");
const { hash, compare } = require("bcryptjs")

const AppError = require("../utils/AppError");


class UsersController {

    async create(request, response) {
        const { name, email, password } = request.body
        

        const checkUserExists = await knex("users").where({ email }).first();
        console.log(checkUserExists);

        if (checkUserExists) {
            console.log("entrou");
            throw new AppError("Este e-mail já está em uso.");
        }

        const hashedPassword = await hash(password, 8)
        
        await knex("users").insert({
            name,
            email,
            password: hashedPassword
        });


        return response.status(201).json({"Message": "Criado com sucesso"});

    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body
        const { id } = request.params

        //const database = await sqliteConnection();
        //const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

        const user = await knex("users").where( { id }).first()

        if (!user) {
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdatedEmail = await knex("users").whereNot({ id }).andWhere({ email }).first()
        
        if (userWithUpdatedEmail) {
            console.log('entrou');
            throw new AppError("Este E-mail já está em uso.");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;


        if (password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha.");
        }

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError("A senha antiga não confere.");

            }

            user.password = await hash(password, 8);
        }
        
        await knex("users").where({ id }).update({
            name: user.name,
            email: user.email,
            password: user.password,
            updated_at: knex.raw("DATETIME('now')"),
          })

        return response.status(200).json({ "message": "Atualizado com sucesso"})    ;

    }
}


module.exports = UsersController;