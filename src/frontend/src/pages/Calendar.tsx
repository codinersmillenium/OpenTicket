'use client';
import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import { EventInput, EventClickArg } from "@fullcalendar/core/index.js";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { checkPrincipal, initActor } from "../lib/canisters";
import { dateStringToUnix } from "../lib/utils";
import { ToastContainer, toast } from 'react-toastify';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  // const { NotificationContainer, NotificationManager } = Notifications;
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [insufficient, setInsufficient] = useState(false);

  const [seat, setSeat] = useState([false])
  const [loading, setLoading] = useState(false)
  const onSeat = (i: number) => {
    const newSeats = [...seat]
    newSeats[i] = !newSeats[i]
    setSeat(newSeats)
  }
  const formDefault = {
      id: 0,
      name: '',
      desc: '',
      dateStart_: '',
      dateEnd_: '',
      latitude: [],
      longitude: [],
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
  const handleChange = (e: any) => {
    const { name, value } = e.target
    const seatMatch = name.match(/^seat\[(\d+)\]\[(.+)\]$/);
    const parseValue = (val: any) => {
      return val.trim() !== "" && !isNaN(Number(val)) ? Number(val) : val;
    };
    if (seatMatch) {
      const index = parseInt(seatMatch[1], 10);
      const field = seatMatch[2];
      setFormData((prev: any) => {
        const newSeats = [...prev.seat];
        newSeats[index] = { ...newSeats[index], [field]: parseValue(value) };
        return { ...prev, seat: newSeats };
      });
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: parseValue(value),
      }));
    }
  }

  const getEvents = async () => { 
    setLoading(true)
    try {
      const actor = await initActor("event")
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
  const handleAddOrUpdateEvent = async (e: any) => {
    e.preventDefault();
    setLoading(true)
    try {
        const actor = await initActor("event")
        formData.dateStart = dateStringToUnix(formData.dateStart_)
        formData.dateEnd = dateStringToUnix(formData.dateEnd_)
        const {ok} = await actor.updateorCreateEvent(formData)
        switch (ok?.status) {
          case 'success':
            toast.success("Success Register Event...")
            setTimeout(() => {
                window.location.href = '/calendar'
            }, 300);
            break;
          case 'insufficient':
            setInsufficient(true);
            setCountToken(ok?.message);
            setTokenTopup(ok?.message);
            break;
        }
    } catch (error) {
      toast.error("Failed Register Event...")
    }
    setLoading(false)
    closeModal();
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <LoadingOverlay open={loading} />
        <ToastContainer/>
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
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Event" : "Add Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plan your next big moment: schedule or edit an event to stay on
                track
              </p>
            </div>
            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange(e)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Event Description
                  </label>
                  <input
                    id="event-desc"
                    name="desc"
                    type="text"
                    value={formData.desc}
                    onChange={(e) => handleChange(e)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    name="dateStart_"
                    type="date"
                    value={formData.dateStart_}
                    onChange={(e) => handleChange(e)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Enter End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    name="dateEnd_"
                    type="date"
                    value={formData.dateEnd_}
                    onChange={(e) => handleChange(e)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>
             <fieldset className="border border-gray-300 p-4 rounded-md mt-6">
                <legend className="text-sm font-medium text-gray-700 mb-2">Seat</legend>
                <div className="space-y-1">
                  <div className="flex justify-end">
                    <button
                        type="button"
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-10"
                      >Add</button>
                  </div>
                  { seat.map((i, k: number) => 
                    <fieldset className="border border-gray-300 p-2 rounded-md" key={k}>
                      <legend className="text-sm font-medium text-gray-700">
                        <button
                          type="button"
                          className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                          onClick={() => onSeat(k)}
                        >Seat { k + 1 }</button>
                      </legend>
                      {i && 
                      <div>
                        <div className="mb-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Name
                          </label>
                          <input
                            type="text"
                            name={`seat[${k}][name]`}
                            value={formData.seat[k].name}
                            onChange={(e) => handleChange(e)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Ticket Price (Rp)
                          </label>
                          <input
                            type="number"
                            name={`seat[${k}][priceTicket]`}
                            value={formData.seat[k].priceTicket}
                            onChange={(e) => handleChange(e)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Total Participant
                          </label>
                          <input
                            type="number"
                            name={`seat[${k}][participantTotal]`}
                            value={formData.seat[k].participantTotal}
                            onChange={(e) => handleChange(e)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Royalti Resale Ticket (%)
                          </label>
                          <input
                            type="number"
                            name={`seat[${k}][royaltiTicketResale]`}
                            value={formData.seat[k].royaltiTicketResale}
                            onChange={(e) => handleChange(e)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Max Price Resale Ticket (%)
                          </label>
                          <input
                            type="number"
                            name={`seat[${k}][priceTicketMax]`}
                            value={formData.seat[k].priceTicketMax}
                            onChange={(e) => handleChange(e)}
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                        </div>
                      </div>}
                    </fieldset>
                  ) }
                  
                </div>
            </fieldset>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
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

export default Calendar;
