import { CastHomeClub } from "@/features/cast-home/cast-home-club";
import { CastHomeCabaret } from "@/features/cast-home/cast-home-cabaret";
import { fetchCastHomeData } from "@/features/cast-home/actions";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
import {
  getUnreadCastMessages,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export default async function CastHomePage() {
  // castId だけ先に解決し、業態(venueType)は重いデータ取得と並列で走らせる。
  // 以前は venueType がデータ取得をブロックして待ち時間を伸ばしていた。
  const castId = await getCurrentCastId();

  const [venueType, data, storeMessages, customers] = await Promise.all([
    getCurrentVenueType(),
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
