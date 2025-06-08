// services/userService.js

const supabase = require('../config/db');

// Função para obter todos os usuários
const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error('Erro ao obter usuários: ' + error.message);
  }
};

// Função para obter um usuário por ID
const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error('Erro ao obter usuário: ' + error.message);
  }
};

// Função para criar um novo usuário
const createUser = async (name, email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error('Erro ao criar usuário: ' + error.message);
  }
};

// Função para atualizar um usuário por ID
const updateUser = async (id, name, email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error('Erro ao atualizar usuário: ' + error.message);
  }
};

// Função para deletar um usuário por ID
const deleteUser = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error('Erro ao deletar usuário: ' + error.message);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
