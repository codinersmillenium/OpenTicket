import { FC, useEffect, useState } from "react";
import { MoneyCheckIcon, QrcodeIcon, WalletIcon } from '../../icons';
import { Modal } from "../ui/modal";
import { convertToToken } from "../../lib/canisters";
import { formatCurrency } from "../../lib/utils";

type PaymentMethodProps = {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    item: any;
    detail: any;
};

const PaymentMethod: FC<PaymentMethodProps> = ({ isModalOpen, setIsModalOpen, item, detail }) => {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(1);
  const [order, setOrder] = useState<any>()

  const paymentMethods = [
    { id: 1, name: "Token Wallet", icon: <WalletIcon className="w-8 h-8" />, soon: false },
    { id: 2, name: "QRIS", icon: <QrcodeIcon className="w-8 h-8" />, soon: true },
    { id: 3, name: "Virtual Number", icon: <MoneyCheckIcon className="w-8 h-8" />, soon: true },
  ];

  const handleMethodSelect = (methodId: any) => {
    setSelectedMethod(methodId);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  const handleConfirmPayment = () => {
    console.log(`Payment method ${selectedMethod} selected`);
    handleModalClose();
  };

  const initOrder = async () => {
    try {
        const price = Number(detail?.seat[0].priceTicket)
        let row: any = {
            id: item?.id,
            total_sub: detail?.priceTicket,
            total: Number(item?.total)
        }
        row.total_service = row.total - price
        row.totalToken = await convertToToken(row.total)
        setOrder(row)   
    } catch (error) {}
  }
  useEffect(() => {
    initOrder()
  }, [isModalOpen])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            className="m-4 w-lg p-6 lg:p-10 mt-[200px]"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                <div className="p-8 border-b border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Order Summary</h2>
                    <div className="space-y-6">    
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg text-gray-600">INVOICE</h3>
                                <p className="text-gray-600">{ order?.id }</p>
                            </div>
                            <p className="text-lg font-medium text-gray-600">{ order?.total_sub }</p>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-700">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{ order?.total_sub }</span>
                            </div>
                            <div className="flex justify-between text-gray-600 mt-3">
                                <span>Service (2%)</span>
                                <span>{ formatCurrency(order?.total_service) }</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900 mt-6">
                                <span>Total</span>
                                <span>{ formatCurrency(order?.total) }</span>
                            </div>
                            <div className="flex justify-between text-md font-bold text-gray-600 mt-2">
                                <span>Convert Token TCT</span>
                                <span>{ order?.totalToken }</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Select Payment Method
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => handleMethodSelect(method.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                            !method.soon ? (selectedMethod === method.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-blue-400") : "bg-gray-200"
                            }`}
                            role="button"
                            aria-pressed={selectedMethod === method.id}
                        >
                            <div className="flex items-center space-x-4 justify-between">
                                <div className="flex items-center">
                                    <div className="text-blue-600">{method.icon}</div>
                                    <span className="font-medium text-gray-900">
                                        {method.name}
                                    </span>
                                </div>
                                {method.soon && <div className="p-2 rounded-lg bg-yellow-200">
                                    Soon
                                </div>}
                            </div>
                        </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <button
                        onClick={handleConfirmPayment}
                        disabled={!selectedMethod}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                            selectedMethod
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        aria-disabled={!selectedMethod}
                        >
                        Pay Now
                        </button>
                    </div>
                </div>
            </div>
          </Modal>
    </div>
  );
};

export default PaymentMethod;