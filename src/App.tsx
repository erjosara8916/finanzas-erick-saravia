import LoanForm from './components/loan/LoanForm';
import ExtraPaymentsManager from './components/loan/ExtraPaymentsManager';
import AmortizationTable from './components/loan/AmortizationTable';
import LoanSummary from './components/loan/LoanSummary';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Motor de Simulación Financiera
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calculate and visualize loan amortization tables with precision
          </p>
        </header>

        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="transition-all duration-300">
              <LoanForm />
            </div>
            <div className="transition-all duration-300">
              <ExtraPaymentsManager />
            </div>
          </div>

          <div className="transition-all duration-300">
            <LoanSummary />
          </div>

          <div className="transition-all duration-300">
            <AmortizationTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
