import { CastHomeClub } from "@/features/cast-home/cast-home-club";
import { CastHomeCabaret } from "@/features/cast-home/cast-home-cabaret";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
import {
  getUnreadCastMessages,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export default async function CastHomePage() {
  const [castId, venueType] = await Promise.all([
    getCurrentCastId(),
    getCurrentVenueType(),
  ]);

  const [data, storeMessages, customers] = await Promise.all([
    fetchCastHomeData(castId),
    getUnreadCastMessages(castId),
    getCustomersForCast(castId),
  ]);

  const messages = storeMessages.map((m) => ({
    id: m.id,
    message: m.message,
    sent_at: m.sent_at,
  }));

  if (venueType === "cabaret") {
    return (
      <CastHomeCabaret
        data={data}
        storeMessages={messages}
        customers={customers}
      />
    );
  }

  return (
    <CastHomeClub data={data} storeMessages={messages} customers={customers} />
  );
}
