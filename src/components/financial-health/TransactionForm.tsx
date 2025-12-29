import { useState } from 'react';
import { useFinancialHealthStore } from '../../store/financialHealthStore';
import Input from '../ui/Input';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { TransactionType, IncomeCategory, ExpenseCategory } from '../../types/schema';
import { Decimal } from 'decimal.js';

const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: 'salario_fijo', label: 'Salario Fijo' },
  { value: 'bonos_comisiones', label: 'Bonos/Comisiones' },
  { value: 'renta_alquileres', label: 'Renta/Alquileres' },
  { value: 'inversiones', label: 'Inversiones' },
  { value: 'otros', label: 'Otros' },
];

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'deudas_existentes', label: 'Deudas Existentes' },
  { value: 'ocio_vicios', label: 'Ocio' },
  { value: 'educacion', label: 'Educación' },
  { value: 'salud', label: 'Salud' },
  { value: 'caridad_regalos', label: 'Caridad/Regalos' },
  { value: 'familia', label: 'Familia' },
  { value: 'otros', label: 'Otros' },
];

export default function TransactionForm() {
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const addTransaction = useFinancialHealthStore((state) => state.addTransaction);

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!amount || new Decimal(amount).lte(0)) {
      newErrors.amount = 'El monto es requerido y debe ser mayor a cero';
    }
    
    if (!category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    addTransaction({
      type,
      amount,
      description: description.trim(),
      category: category as IncomeCategory | ExpenseCategory,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(''); // Reset category when type changes
    setErrors({}); // Clear errors when type changes
  };

  return (
    <Card 
      title="Agregar Transacción"
      description="💡 Recuerda ingresar tus gastos e ingresos en montos mensuales. Esto nos ayudará a calcular con precisión tu capacidad de pago."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Type */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all
              ${type === 'income'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            + Ingreso
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all
              ${type === 'expense'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            - Gasto
          </button>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.description;
                  return newErrors;
                });
              }
            }}
            placeholder="Ej: Nómina, Alquiler, Netflix..."
            error={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Amount and Category in same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Monto ($)</Label>
            <InputCurrency
              id="amount"
              value={amount}
              onChange={(value) => {
                setAmount(value);
                if (errors.amount) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.amount;
                    return newErrors;
                  });
                }
              }}
              placeholder="0.00"
              error={!!errors.amount}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.category;
                    return newErrors;
                  });
                }
              }}
              error={!!errors.category}
            >
              <option value="">Selecciona una categoría</option>
              {currentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Agregar a la lista
        </Button>
      </form>
    </Card>
  );
}

