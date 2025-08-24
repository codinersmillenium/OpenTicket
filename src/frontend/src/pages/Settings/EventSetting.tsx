'use client';
import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import { EventInput, EventClickArg } from "@fullcalendar/core/index.js";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { checkPrincipal, initActor } from "../../lib/canisters";
import { toast } from 'react-toastify';
import FormEvent from "../../components/common/FormEvent";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const EventSetting: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [insufficient, setInsufficient] = useState(false);
  const [loading, setLoading] = useState(false)
  
  const formDefault = {
      id: 0,
      name: '',
      desc: '',
      tags: '',
      dateStart_: '',
      dateEnd_: '',
      location: '',
      image_: '',
      seat: [
        {
          id: 0,
          eventId: 0,
          name: '',
          priceTicket: 0,
          participantTotal: 0,
          royaltiTicketResale: 0,
          priceTicketMax: 0,
        }
      ]
  }
  const [formData, setFormData]: any = useState(formDefault)

  const addEvent = () => {
    setFormData(formDefault)
    setSelectedEvent(null)
    openModal()
  }

  const getEvents = async () => {
    setLoading(true)
    try {
      const actor = await initActor('event')
      const principal = await checkPrincipal()
      const {ok} = await actor.getEventsByOwned(principal)
      var events = []
      for(let i in ok) {
        const dateStart = Number(ok[i].dateStart)
        const dateEnd = Number(ok[i].dateEnd)
        const row = {
          id: ok[i].id,
          title: ok[i].name,
          start: new Date(dateStart * 1000).toISOString().split("T")[0],
          end: new Date(dateEnd * 1000).toISOString().split("T")[0],
          extendedProps: { calendar: "Primary" },
        }
        events.push(row)
      }
      setEvents(events)
    } catch (error) {
      setLoading(false)
    }
    setLoading(false)
  };
  useEffect(() => {
    // Initialize with some events
    getEvents()
  }, []);

  const handleEventClick = async (clickInfo: EventClickArg) => {
    setLoading(true)
    try {
      const event = clickInfo.event;
      setSelectedEvent(event as unknown as CalendarEvent);
      const actor = await initActor("event")
      var {ok} = await actor.getEvents(parseFloat(event.id))
      if (ok.length > 0) {
        const dateStart = Number(ok[0].dateStart)
        const dateEnd = Number(ok[0].dateEnd)
        ok[0].dateStart_ = new Date(dateStart * 1000).toISOString().split("T")[0]
        ok[0].dateEnd_ = new Date(dateEnd * 1000).toISOString().split("T")[0]
        setFormData(ok[0])
        openModal();
      } else {
        toast.info("Data not found...")
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error("Error get data...")
    }
  };

  const [tokenTopup, setTokenTopup] = useState(0)
  const [countToken, setCountToken] = useState(0)
  const handleTopup = (e: any) => {
    console.log(e)
  }

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <LoadingOverlay open={loading} />
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: addEvent,
              },
            }}
          />
        </div>
        <Modal
          isOpen={insufficient}
          onClose={() => setInsufficient(false)}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-900">
              {/* Notification */}
              <div className="mb-4">
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  Your tokens are insufficient
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  An initial deposit of{' '}<span className='font-semibold text-gray-800 dark:text-white'>{ countToken } tokens</span>{' '}
                  is required (6% of total ticket price X participants).  This deposit is temporary and will be partially refunded if ticket sales do not reach the target.  
                  Tokens will only be deducted according to the actual tickets sold.
                </p>
              </div>

              {/* Top-Up Form */}
              <form className="space-y-4" onSubmit={handleTopup}>
                <div>
                  <label
                    htmlFor="topup"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Token Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter token amount"
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 
                              bg-transparent px-4 text-sm text-gray-800 dark:text-white 
                              shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500
                              focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
                    value={tokenTopup}
                    onChange={(e: any) => setTokenTopup(e.target.value)}
                    min={countToken}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white 
                            font-medium rounded-lg shadow-md transition"
                >
                  Top Up Now
                </button>
              </form>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
           <FormEvent
            formData={formData}
            selectedEvent={selectedEvent}
            setLoading={setLoading}
            setCountToken={setCountToken}
            setInsufficient={setInsufficient}
            setTokenTopup={setTokenTopup}
            setFormData={setFormData}
            getEvents={getEvents}
            closeModal={closeModal}
          />
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default EventSetting;
