import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin, loginAluno } from './helpers/auth.js';
import alunos from './data/alunos.json' with { type: 'json' };

describe('Fluxo de aluno', () => {
  let tokenAdmin;

  before(async () => {
    tokenAdmin = await loginAdmin();

    expect(tokenAdmin).to.be.a('string');
  });

  alunos.forEach((dadosAluno) => {
    it(`deve cadastrar, autenticar e registrar trabalho para ${dadosAluno.nome}`, async () => {
      const identificador = Date.now();

      const aluno = {
        nome: dadosAluno.nome,
        email: `${dadosAluno.emailPrefix}.${identificador}@example.com`,
        matricula: `${dadosAluno.matriculaPrefix}${identificador}`,
        senha: dadosAluno.senha,
      };

      const cadastro = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(aluno);

      expect(cadastro.status).to.equal(201);
      expect(cadastro.body).to.have.property('id');

      const alunoId = cadastro.body.id;

      const matricula = await request(app)
        .post('/api/admin/disciplinas/disciplina-matematica/matriculas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
            alunoId,
        });

        expect(matricula.status).to.equal(201);

      const tokenAluno = await loginAluno(
        aluno.email,
        aluno.senha
      );

      expect(tokenAluno).to.be.a('string');

      const trabalho = await request(app)
        .post(`/api/alunos/${alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send(dadosAluno.trabalho);

        console.log('Resposta do trabalho:', trabalho.body);
      expect(trabalho.status).to.equal(201);
    });
  });
});