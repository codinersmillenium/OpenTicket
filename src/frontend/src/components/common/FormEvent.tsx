import React, { FC, useState } from "react";
import { dateStringToUnix, fileToBase64 } from "../../lib/utils";
import { initActor } from "../../lib/canisters";
import { toast } from 'react-toastify';

type EventDetailProps = {
  formData: any;
  selectedEvent: any;
  setFormData: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setInsufficient: React.Dispatch<React.SetStateAction<boolean>>;
  setCountToken: React.Dispatch<React.SetStateAction<number>>;
  setTokenTopup: React.Dispatch<React.SetStateAction<number>>;
  getEvents(): void;
  closeModal(): void;
};

const FormEvent: FC<EventDetailProps> = ({ formData, setFormData, setLoading, selectedEvent, getEvents, setCountToken, setTokenTopup, setInsufficient, closeModal }) => {
  const [base64Image, setBase64Image] = useState<string>("")
  const [seat, setSeat] = useState([false])
  const onSeat = (i: number) => {
    const newSeats = [...seat]
    newSeats[i] = !newSeats[i]
    setSeat(newSeats)
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

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await fileToBase64(file)
      setBase64Image(base64)
    }
  }

  const handleAddOrUpdateEvent = async (e: any) => {
    e.preventDefault();
    setLoading(true)
    try {
        const actor = await initActor("event")
        formData.dateStart = dateStringToUnix(formData.dateStart_)
        formData.dateEnd = dateStringToUnix(formData.dateEnd_)
        formData.image = [base64Image]
        const {ok} = await actor.updateorCreateEvent(formData)
        switch (ok?.status) {
          case 'success':
            toast.success("Success Update Event...")
            getEvents()
            break;
          case 'insufficient':
            setInsufficient(true);
            setCountToken(ok?.message);
            setTokenTopup(ok?.message);
            break;
        }
    } catch (error) {
      toast.error("Failed Update Event...")
    }
    setLoading(false)
    closeModal();
  };

  return (
    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar mt-[300px]">
      <div>
        <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
          {selectedEvent ? "Edit Event" : "Add Event"}
        </h5>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Plan your next big moment: schedule or edit an event to stay on
          track
        </p>
      </div>
      <form onSubmit={handleAddOrUpdateEvent}>
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
                required
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
                required
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
          <div className="mt-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tags Event
              </label>
              <input
                id="event-tags"
                name="tags"
                type="text"
                placeholder="example: Concert, Party...."
                value={formData.tags}
                onChange={(e) => handleChange(e)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Location
              </label>
              <input
                id="event-location"
                name="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange(e)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Image (opsional)
              </label>
              <input
                id="event-image"
                name="image_"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleFileChange(e)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
            className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {selectedEvent ? "Update Changes" : "Add Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEvent;