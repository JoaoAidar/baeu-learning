const supabase = require('../lib/supabase');

// Get a single lesson by lessonId
exports.getLessonById = async (req, res) => {
  const { lessonId } = req.params;

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

// Get all lessons
exports.getAllLessons = async (req, res) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};
