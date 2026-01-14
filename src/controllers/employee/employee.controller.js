import Employee from "../../models/employee/employee.model.js";
export const getAllEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}