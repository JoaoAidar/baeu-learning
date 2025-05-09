const supabase = require('../config/db');

class Lesson {
    static async findById(id) {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async findAll() {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .order('order_index');

        if (error) throw error;
        return data;
    }

    static async create(lessonData) {
        const { title, description, order_index } = lessonData;
        const { data, error } = await supabase
            .from('lessons')
            .insert([{ title, description, order_index }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, lessonData) {
        const { title, description, order_index } = lessonData;
        const { data, error } = await supabase
            .from('lessons')
            .update({ 
                title, 
                description, 
                order_index,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id) {
        const { data, error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = Lesson; 