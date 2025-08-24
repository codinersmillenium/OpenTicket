import React, { FC, useEffect, useState } from "react";
import { formatCurrency, formatDate } from "../../lib/utils";
import { initActor } from "../../lib/canisters";

type EventDetailProps = {
  eventDetail: any;
  setEventDetail: React.Dispatch<React.SetStateAction<{}>>;
  bookEvent(): void;
};

const EventDetail: FC<EventDetailProps> = ({ eventDetail, setEventDetail, bookEvent }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [total, setTotal] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const getParticipant = async () => {
    const actor = await initActor('ticket')
    const { ok } = await actor.getTicketQty(eventDetail.seat[0].id)
    const total = Number(ok)
    if (Number(eventDetail.seat[0].participantTotal) < total) {
      setDisabled(true)
    }
    setTotal(total)
  }

  const initComponent = async () => {
    await getParticipant();
    setEventDetail((prev: any) => ({
      ...prev,
      dateStart: formatDate(new Date(Number(eventDetail.dateStart) * 1000)),
      dateEnd: formatDate(new Date(Number(eventDetail.dateEnd) * 1000)),
      image: (eventDetail.image[0] ? eventDetail.image[0] : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3"),
      priceTicket: formatCurrency(Number(eventDetail.seat[0].priceTicket)),
      participant: Number(eventDetail.seat[0].participantTotal),
      sold: total
    }));
  }

  useEffect(() => {
    initComponent()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div 
            className="relative overflow-hidden rounded-lg"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <img
              src={eventDetail.image}
              alt={eventDetail.name}
              className={`w-full h-[590px] object-cover transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
            />
            <div className="absolute top-4 right-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {eventDetail.tags}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{eventDetail.name}</h1>
          <h2 className="text-xl text-gray-600">{eventDetail.dateStart} to {eventDetail.dateEnd}</h2>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-lg text-gray-500">{eventDetail.priceTicket}</span>
            </div>
          </div>

          <p className="text-gray-600">{eventDetail.desc}</p>

          <div className="space-y-4">
            {/* Added: Book-specific details */}
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <p className="font-semibold">Participants:</p>
                <p>{eventDetail.participant}</p>
              </div>
              <div>
                <p className="font-semibold">Sold:</p>
                <p>{eventDetail.sold}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="flex items-center space-x-4">
                <p>{eventDetail.location}</p>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-lg text-white font-semibold ${!disabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={disabled}
              onClick={bookEvent}
            >
              {!disabled ? 'Book Now' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;