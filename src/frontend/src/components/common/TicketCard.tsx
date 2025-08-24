'use client';
import React, { useEffect, useState } from "react";
import { CalenderIcon } from "../../icons";
import { initActor } from "../../lib/canisters";
import { formatCurrency, formatDate, formatDay } from "../../lib/utils";

type TicketCardProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const TicketCard: React.FC<TicketCardProps> = ({ setLoading }) => {
  const [events, setEvents]: any = useState([])
  const getEvents = async () => {
    setLoading(true)
    try {
      const actor = await initActor('event')
      const { ok } = await actor.getEvents(0)
      let rows = []
      for (let i in ok) {
        const dateStart = new Date(Number(ok[i].dateStart) * 1000)
        const row = {
          id: ok[i].id,
          title: ok[i].name,
          image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3",
          date: formatDate(dateStart),
          dayOfWeek: formatDay(dateStart),
          location: "Innovation Center",
          price:(ok[i].seat.length > 0 ? formatCurrency(ok[i].seat[0].priceTicket, 'IDR') : null),
          category: ok[i].tags,
          description: ok[i].desc
        }
        rows.push(row)
      }
      setEvents(rows)
    } catch (error) {
      setLoading(false)
    }
    setLoading(false)
  };
  useEffect(() => {
    getEvents()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {events.map((event: any) => (
          <div
            key={event.id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="relative overflow-hidden aspect-w-16 aspect-h-9">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1496450681664-3df85efbd29f?ixlib=rb-4.0.3";
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {event.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <CalenderIcon className="text-blue-600 mr-2"/>
                <div>
                  <p className="text-gray-600 text-sm">{event.dayOfWeek}</p>
                  <p className="font-semibold text-gray-800">{event.date}</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center text-sm text-gray-500">
                  Purchased on {event.purchaseDate}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800">{event.price}</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300">
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketCard;