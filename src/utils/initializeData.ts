
export const initializeInvestmentPackages = () => {
  const packages = localStorage.getItem('investx_packages');
  if (!packages) {
    const defaultPackages = [
      {
        id: '1',
        name: 'Starter Package',
        amount: 5000,
        returnAmount: 6000,
        duration: 7,
        maxUses: 1,
        isActive: true,
        description: 'Perfect for beginners - 20% return in 7 days',
      },
      {
        id: '2',
        name: 'Growth Package',
        amount: 10000,
        returnAmount: 12500,
        duration: 14,
        maxUses: 2,
        isActive: true,
        description: 'Medium term investment - 25% return in 14 days',
      },
      {
        id: '3',
        name: 'Premium Package',
        amount: 25000,
        returnAmount: 32500,
        duration: 30,
        maxUses: 3,
        isActive: true,
        description: 'High return investment - 30% return in 30 days',
      },
    ];
    localStorage.setItem('investx_packages', JSON.stringify(defaultPackages));
  }
};

// Initialize packages when the app loads
initializeInvestmentPackages();
