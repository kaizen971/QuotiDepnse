require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// OBLIGATOIRE: Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'QuotiDepnse',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['bug', 'feature', 'improvement', 'other'] },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Routes Auth
app.post('/QuotiDepnse/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/QuotiDepnse/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes Expenses (protégées)
app.post('/QuotiDepnse/expenses', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = new Expense({
      userId: req.userId,
      amount,
      category,
      description,
      date: date || new Date()
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/QuotiDepnse/expenses', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/QuotiDepnse/expenses/stats', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });

    const totalByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      total,
      byCategory: totalByCategory,
      count: expenses.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/QuotiDepnse/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { amount, category, description, date },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/QuotiDepnse/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    res.json({ message: 'Dépense supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes Profil (protégées)
app.get('/QuotiDepnse/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/QuotiDepnse/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes Feedback (protégées)
app.post('/QuotiDepnse/feedback', authMiddleware, async (req, res) => {
  try {
    const { type, message } = req.body;
    const feedback = new Feedback({
      userId: req.userId,
      type,
      message
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback envoyé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/QuotiDepnse/feedback', authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de test
app.get('/QuotiDepnse/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuotiDepnse API is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
