const Customer =require("../models/customer");
exports.getAllCustomers = async (req, res) => {
    try{
        const customers =await Customer.getAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCustomerById = async (req, res) => {
    try{
        const customer =await Customer.getById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
        
    }
};
exports.createCustomer = async (req, res) => {
    try{
        const customer =await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};