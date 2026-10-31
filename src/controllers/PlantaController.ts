import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";



export const createPlanta = async (req: Request, res: Response) => {
  try {
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias} = req.body;

    // 400 Bad Request: o cliente mandou dados incompletos
    if (
        nome === undefined ||
        especie === undefined ||
        preco === undefined ||
        estoque === undefined ||
        luminosidade === undefined ||
        petFriendly === undefined ||
        regaACadaDias === undefined
    ) {
      return res.status(400).json({
        message: "Preencha nome, espécie, preço, estoque, luminosidade, petFriendly e regaACadaDias.",
      });
    }

    if (
      typeof nome !== "string" || nome.trim() === "" ||
      typeof especie !== "string" || especie.trim() === "" ||
      !Number.isInteger(preco) || preco <= 0 ||
      !Number.isInteger(estoque) || estoque < 0 ||
      !Object.values(Luminosidade).includes(luminosidade) ||
      typeof petFriendly !== "boolean" ||
      !Number.isInteger(regaACadaDias) || regaACadaDias <= 0
    ) {
      return res.status(400).json({ message: "Dados da planta inválidos." });
    }

    const planta = await PlantaRepository.createPlanta({
        nome,               
        especie,          
        preco,              
        estoque,     
        luminosidade, 
        petFriendly,   
        regaACadaDias,
    });

    // 201 Created: algo novo foi criado
    return res.status(201).json(planta);
  } catch (error) {
    console.error(error);
    // 500 Internal Server Error: o problema foi nosso, não da planta
    return res.status(500).json({ message: "Erro ao criar planta." });
  }
};

export const findAllPlantas = async (req: Request, res: Response) => {
  try {
    const { petFriendly, luminosidade } = req.query;

    // Filtro petFriendly
    let petFriendlyParsed: boolean | undefined = undefined;
    if (petFriendly !== undefined) {
      if (petFriendly !== "true" && petFriendly !== "false") {
        return res.status(400).json({ message: "Filtro petFriendly inválido." });
      }
      petFriendlyParsed = petFriendly === "true";
    }

    // Filtro luminosidade
    let luminosidadeParsed: Luminosidade | undefined = undefined;
    if (luminosidade !== undefined) {
      if (!Object.values(Luminosidade).includes(luminosidade as Luminosidade)) {
        return res.status(400).json({ message: "Filtro luminosidade inválido." });
      }
      luminosidadeParsed = luminosidade as Luminosidade;
    }

    const plantas = await PlantaRepository.findAllPlantas({
      petFriendly: petFriendlyParsed,
      luminosidade: luminosidadeParsed,
    });

    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plantas." });
  }
};

export const findPlantaById = async (req: Request, res: Response) => {
  try {
    // O id chega da URL como texto, então convertemos para número
    const id = Number(req.params.id);

    if (!(Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    // 404 Not Found: o id não existe
    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    return res.status(200).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar planta." });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!(Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    // Antes de editar, garantimos que a planta existe
    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
      return res.status(400).json({ message: "Nome inválido." });
    }
    if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
      return res.status(400).json({ message: "Espécie inválida." });
    }
    if (preco !== undefined && (!Number.isInteger(preco) || preco <= 0)) {
      return res.status(400).json({ message: "Preço inválido." });
    }
    if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) {
      return res.status(400).json({ message: "Estoque inválido." });
    }
    if (luminosidade !== undefined && !Object.values(Luminosidade).includes(luminosidade)) {
      return res.status(400).json({ message: "Luminosidade inválida." });
    }
    if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
      return res.status(400).json({ message: "PetFriendly inválido." });
    }
    if (regaACadaDias !== undefined && (!Number.isInteger(regaACadaDias) || regaACadaDias <= 0)) {
      return res.status(400).json({ message: "RegaACadaDias inválido." });
    }

    // PATCH = atualização parcial: campos não enviados (undefined) não são alterados
    const updatedPlanta = await PlantaRepository.updatePlanta(id, {
      nome,               
    especie,          
    preco,              
    estoque,     
    luminosidade, 
    petFriendly,   
    regaACadaDias,
    });

    return res.status(200).json(updatedPlanta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!(Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const planta = await PlantaRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantaRepository.deletePlanta(id);

    // 204 No Content: deu certo e não há nada para devolver
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar planta." });
  }
};


export const comprarPlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { quantidade } = req.body;

    if (!(Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!(Number.isInteger(quantidade) && quantidade > 0)) {
      return res.status(400).json({ message: "Quantidade inválido." });
    }

    // Antes de editar, garantimos que a planta existe
    const resultado = await PlantaRepository.decrementarEstoque(id, quantidade);

    if (resultado.count === 0) {
      const planta = await PlantaRepository.findPlantaById(id);
      if (!planta) {
        return res.status(404).json({ message: "Planta não encontrada." });
      }

      return res.status(400).json({ message: "Estoque insuficiente." });
    }
    
    const plantaAtualizada = await PlantaRepository.findPlantaById(id);

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao comprar planta." });
  }
};

export const relatorioEstoque = async (req: Request, res: Response) => {
  try {
    const plantas = await PlantaRepository.encontraPrecoEEstoque();

    const valorTotal = plantas.reduce((acc, planta) => {
      return acc + planta.preco * planta.estoque;
    }, 0);

    const quantidadeTotal = plantas.reduce((acc, planta) => {
      return acc + planta.estoque;
    }, 0);

    return res.status(200).json({
      valorTotal,
      quantidadeTotal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao calcular relatório do estoque." });
  }
};