import Category from '../models/Category.js';
import Product from '../models/Product.js';

const benefits = [
  {
    icon: 'bi-shield-check',
    title: 'Productos 100% Originales',
    description: 'Trabajamos directamente con marcas reconocidas para garantizar la autenticidad de cada producto.'
  },
  {
    icon: 'bi-truck',
    title: 'Envío Rápido y Seguro',
    description: 'Recibe tus productos en la puerta de tu casa con entregas rápidas y empaque cuidadoso.'
  },
  {
    icon: 'bi-star',
    title: 'Asesoría Personalizada',
    description: 'Nuestro equipo de expertos te ayuda a encontrar los productos ideales para tu tipo de piel.'
  },
  {
    icon: 'bi-arrow-repeat',
    title: 'Devoluciones Sin Complicaciones',
    description: 'Si no estás satisfecha, puedes devolver tu producto en un plazo de 30 días.'
  }
];

const whyUs = [
  {
    icon: 'bi-heart',
    title: 'Cuidado de tu Piel',
    description: 'Seleccionamos cuidadosamente cada producto para ofrecerte lo mejor para el cuidado de tu piel.'
  },
  {
    icon: 'bi-emoji-smile',
    title: 'Experiencia de Compra',
    description: 'Disfruta de una experiencia de compra diseñada pensando en ti, desde la navegación hasta la entrega.'
  },
  {
    icon: 'bi-leaf',
    title: 'Compromiso con la Calidad',
    description: 'Nos asociamos con marcas que comparten nuestro compromiso con la calidad y la sostenibilidad.'
  }
];

export const getLanding = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    const featuredProducts = await Product.find({ isActive: true, featured: true })
      .populate('category')
      .limit(6);

    res.render('landing', {
      title: 'Carely - Cuidado Personal',
      categories,
      featuredProducts,
      benefits,
      whyUs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

export const getCatalog = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    const currentCategory = req.query.category || '';

    const filter = { isActive: true };
    if (currentCategory) {
      const cat = await Category.findOne({ name: currentCategory });
      if (cat) filter.category = cat._id;
    }

    const products = await Product.find(filter)
      .populate('category')
      .sort('-createdAt');

    res.render('catalog', {
      title: 'Catálogo - Carely',
      products,
      categories,
      currentCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};
