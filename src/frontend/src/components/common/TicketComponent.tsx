import { TicketIcon } from "../../icons";


const TicketComponent = () => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white mx-auto my-10 p-5">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 flex items-center">
          <TicketIcon className="text-blue-500 mr-2"/>
          Concert Ticket
        </div>
        <p className="text-gray-700 text-base">
          Join us for an unforgettable night of music and fun!
          <img src="/qrcode_sample.png" alt="" />
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#music</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#concert</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#{new Date().getFullYear()}</span>
      </div>
    </div>
  );
};

export default TicketComponent;