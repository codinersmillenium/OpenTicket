
import { FC } from "react";
import { CalenderIcon } from "../../icons";

type EventCardProps = {
  events: [];
  getEvents(id: number): void;
};

const EventCard: FC<EventCardProps> = ({ getEvents, events }) => {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {events.map((event: any) => (
          <div
            key={event.id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
            onClick={() => getEvents(event.id)}
          >
            <div className="relative overflow-hidden aspect-w-16 aspect-h-9">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3";
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
              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

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

export default EventCard;